const net = require("net");
const fs = require("fs");

function parsePacket(buffer) {
    let offset = 0;
    const symbol = buffer.toString('ascii', offset, offset + 4);
    offset += 4;
    const buysell = buffer.toString('ascii', offset, offset + 1);
    offset += 1;
    const quantity = buffer.readInt32BE(offset);
    offset += 4;
    const price = buffer.readInt32BE(offset);
    offset += 4;
    const sequence = buffer.readInt32BE(offset);
    return { symbol, buysellindicator: buysell, quantity, price, packetSequence: sequence };
}

async function collectPackets() {
    // Step 1: Request all packets (Call Type 1)
    const initialPackets = await new Promise((resolve, reject) => {
        const socket = net.createConnection(3000, 'localhost', () => {
            socket.write(Buffer.from([0x01, 0x00]));
        });

        let buffer = Buffer.alloc(0);
        socket.on('data', (chunk) => {
            buffer = Buffer.concat([buffer, chunk]);
        });

        socket.on('close', () => {
            const packets = [];
            while (buffer.length >= 17) {
                const packetBuffer = buffer.slice(0, 17);
                buffer = buffer.slice(17);
                packets.push(parsePacket(packetBuffer));
            }
            resolve(packets);
        });

        socket.on('error', reject);
    });

    // Find missing sequences
    const sequences = initialPackets.map(p => p.packetSequence);
    const maxSequence = sequences.length > 0 ? Math.max(...sequences) : 0;
    const missing = [];
    for (let seq = 1; seq <= maxSequence; seq++) {
        if (!sequences.includes(seq)) missing.push(seq);
    }

    // Step 2: Request missing packets (Call Type 2)
    for (const seq of missing) {
        const packet = await new Promise((resolve, reject) => {
            const socket = net.createConnection(3000, 'localhost', () => {
                socket.write(Buffer.from([0x02, seq]));
            });

            let response = Buffer.alloc(0);
            socket.on('data', (chunk) => {
                response = Buffer.concat([response, chunk]);
                if (response.length >= 17) {
                    resolve(parsePacket(response.slice(0, 17)));
                    socket.end();
                }
            });

            socket.on('close', () => {
                if (response.length < 17) {
                    reject(new Error(`Incomplete packet for sequence ${seq}`));
                }
            });

            socket.on('error', reject);
        });
        initialPackets.push(packet);
    }

    // Sort and write to JSON
    const sortedPackets = initialPackets.sort((a, b) => a.packetSequence - b.packetSequence);
    fs.writeFileSync('output.json', JSON.stringify(sortedPackets, null, 2));
    console.log('JSON output saved to output.json');
    
    // Create a final socket to send disconnect signal
    const disconnectSocket = net.createConnection(3000, 'localhost', () => {
        disconnectSocket.write(Buffer.from([0x03, 0x00])); 
        disconnectSocket.end();
    });
    
    disconnectSocket.on('error', (err) => {
        console.error('Error during disconnect:', err);
    });
}

collectPackets().catch(err => console.error('Error:', err));