# Exchange Server and Client

This project implements a simple exchange server and client system that handles market data packets. The server sends market data packets to clients, and the client collects and processes these packets.

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

## Project Structure

```
betacrew_exchange_server/
├── main.js          # Exchange server implementation
├── client.js        # Client implementation
├── output.json      # Generated output file (created after running client)
```

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/Hacker-Man07/Betacrew.git
cd betacrew_exchange_server
```

## Running the Application

### Step 1: Start the Server

Open a terminal window and run:
```bash
node main.js
```

The server will start and listen on port 3000.

### Step 2: Run the Client

Open another terminal window and run:
```bash
node client.js
```

The client will:
1. Connect to the server
2. Request and collect all market data packets
3. Handle any missing packets
4. Sort the packets by sequence number
5. Save the results to `output.json`
6. Properly disconnect from the server

## Output

After running the client, you'll find an `output.json` file containing the sorted market data packets. Each packet contains:
- Symbol (4 characters)
- Buy/Sell indicator (1 character)
- Quantity (integer)
- Price (integer)
- Sequence number (integer)

## Protocol Details

The system uses a simple TCP-based protocol with the following packet types:

1. Type 0x01: Request all packets
2. Type 0x02: Request specific packet by sequence number
3. Type 0x03: Disconnect signal

## Troubleshooting

If you encounter any issues:

1. Ensure no other process is using port 3000
2. Check that both server and client are running in separate terminal windows
3. Verify that Node.js is properly installed
4. Check the console output for any error messages

## Notes

- The server must be running before starting the client
- The client will automatically handle missing packets and ensure complete data collection
- The connection is properly closed after data collection is complete 
