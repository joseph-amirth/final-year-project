import json
import socket
import subprocess

from http_client_utils import inform_admin_of_intrusion
from model_utils import predict
from timestamp_utils import difference_in_milliseconds

log_file = '/var/log/snort/alert_json.txt'
watch_process = subprocess.Popen(
    ['tail', '-F', log_file], stdout=subprocess.PIPE)

connections = {}
for line in iter(watch_process.stdout.readline, ''):
    line_str = line.decode('utf-8').strip()
    json_obj = json.loads(line_str)

    if json_obj['sid'] < 10000000:
        inform_admin_of_intrusion(json_obj)
        continue

    src_ap = json_obj['src_ap']
    dst_ap = json_obj['dst_ap']

    proto = socket.getprotobyname(json_obj['proto'])
    service = json_obj['service']

    tcp_len = json_obj['tcp_len'] if 'tcp_len' in json_obj else 0
    tcp_flags = json_obj['tcp_flags'] if 'tcp_flags' in json_obj else ''

    key = f'{src_ap}-{dst_ap}'
    other = f'{dst_ap}-{src_ap}'

    if key in connections:
        info = connections[key]
        info['OUT_BYTES'] += tcp_len
        info['OUT_PKTS'] += 1
    elif other in connections:
        info = connections[other]
        info['IN_BYTES'] += tcp_len
        info['IN_PKTS'] += 1
    else:
        info = dict()
        info['SRC_AP'] = src_ap
        info['DST_AP'] = dst_ap
        info['PROTOCOL'] = proto
        info['L7_PROTO'] = 1
        info['IN_BYTES'] = 0
        info['OUT_BYTES'] = 0
        info['IN_PKTS'] = 0
        info['OUT_PKTS'] = 0
        info['TCP_FLAGS'] = tcp_flags
        info['FLOW_BEGIN_TIME'] = json_obj['timestamp']
        connections[key] = info

    temp = key if key in connections else other
    info = connections[temp]
    info['FLOW_DURATION_MILLISECONDS'] = difference_in_milliseconds(
        info['FLOW_BEGIN_TIME'], json_obj['timestamp'])
    predict(info)
