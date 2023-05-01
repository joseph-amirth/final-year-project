#!/bin/bash

cd ../../fabric-network/test-network/

# Define the command to be run
command_to_run="./mynetwork.sh"

# Define the number of times to run the command
num_runs=10

# Initialize the total time variable to 0
total_time=0

# Run the command num_runs times and measure the time taken each time
for ((i=1; i<=$num_runs; i++)); do
    echo "Running command iteration $i..."
    time_taken=$( TIMEFORMAT="%R"; { time $command_to_run >/dev/null 2>&1; } 2>&1 )
    echo "Time taken on iteration $i is $time_taken seconds."
    echo
    total_time=$(echo "$total_time + $time_taken" | bc)
    ./network.sh down > /dev/null 2>&1
done

# Calculate the average time taken and output the result
average_time=$(bc <<<"scale=3; $total_time/$num_runs")
echo "Average time taken: $average_time seconds."
