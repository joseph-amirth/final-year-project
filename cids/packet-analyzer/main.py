import pyshark
from model import predict

capture = pyshark.LiveCapture(interface='eth0') 

connections = dict()
for packet in capture.sniff_continuously():
    if 'tcp' in packet:
        # Get possible keys from the IP addresses and the ports
        ip = packet['ip']
        tcp = packet['tcp']

        source_ip = ip.src
        source_port = tcp.srcport

        dest_ip = ip.dst
        dest_port = tcp.dstport

        key = f'{source_ip}:{source_port}-{dest_ip}:{dest_port}'
        other = f'{dest_ip}:{dest_port}-{source_ip}:{source_port}'

        # Initialise/Update TCP flow information
        if key in connections:
            info = connections[key]
            info['OUT_BYTES'] += int(tcp.len)
            info['OUT_PKTS'] += 1
        elif other in connections:
            info = connections[other]
            info['IN_BYTES'] += int(tcp.len)
            info['IN_PKTS'] += 1
        else:
            info = dict()
            info['SOURCE_IPV4_ADDRESS_PORT'] = f'{source_ip}:{source_port}';
            info['DEST_IPV4_ADDRESS_PORT'] = f'{dest_ip}:{dest_port}';
            info['PROTOCOL'] = int(packet['ip'].proto)
            info['L7_PROTO'] = 1
            info['IN_BYTES'] = 0
            info['OUT_BYTES'] = 0
            info['IN_PKTS'] = 0
            info['OUT_PKTS'] = 1
            info['TCP_FLAGS'] = packet['tcp'].flags
            info['FLOW_DURATION_MILLISECONDS'] = 0
            connections[key] = info

        temp = key if key in connections else other
        info = connections[temp]
        info['FLOW_DURATION_MILLISECONDS'] = tcp.time_delta
        predict(info)
