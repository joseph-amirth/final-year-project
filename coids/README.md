# CoIDS

## Link to the Dataset:
https://staff.itee.uq.edu.au/marius/NIDS_datasets/ <br>
https://cloudstor.aarnet.edu.au/plus/s/N0JTc8JFNtZtUE4

## Software and Hardware Requirements:

No hardware requirements as such.

1. Docker v23.0.5.
2. Node.js v18.14.0 and NPM v8.15.1.
3. Python 3.8.10.
4. Snort3 installed and configured as in this [document](https://www.snort.org/documents/snort-3-1-18-0-on-ubuntu-18-20). In particular, the alert_json plugin must be enabled.

## Instructions to Execute Source Code:

Ensure the the docker engine and docker desktop is running.

1. Clone this git repository. The root of this repository will henceforth be referred to as fyp.
2. cd into ```fyp/coids/coids-peer``` and build the coids-peer docker image by executing ```docker build -t coids-peer .```.
3. cd into ```fyp/coids/fabric-network/test-network``` and start the network by executing ```./mynetwork.sh```.
4. cd into ```fyp/coids/coids-client```. This is an express server. Hence, install the dependencies by executing ```npm install``` and then run it by executing ```npm start```.
5. Open a new terminal and run snort3 with options configured such that alerts are written to ```/var/log/snort/alert_json.txt```.
6. Then open a new terminal and cd into ```fyp/coids/packet-analyzer``` and run it by executing ```python3 start```.
