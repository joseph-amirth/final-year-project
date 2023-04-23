import threading

from sniff import watch_snort3
from server import start_app

t1 = threading.Thread(target=watch_snort3)
t2 = threading.Thread(target=start_app)

t1.start()
t2.start()
