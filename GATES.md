# open

sudo iptables -D DOCKER-USER 2
sudo iptables -D DOCKER-USER 1
sudo netfilter-persistent save

# close

sudo iptables -I DOCKER-USER 1 -s <your_ip> -p tcp --dport <port> -j RETURN
sudo iptables -I DOCKER-USER 2 -p tcp --dport <port> -j DROP
sudo netfilter-persistent save

# check 

curl -I --connect-timeout 3 http://server:port