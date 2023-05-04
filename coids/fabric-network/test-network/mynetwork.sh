#!/bin/bash

# Start the fabric network.
./network.sh up

# Create a channel.
./network.sh createChannel

# Install chaincode on the channel.
./network.sh deployCC -ccn basic -ccp ../../chaincode-typescript/ -ccl typescript
