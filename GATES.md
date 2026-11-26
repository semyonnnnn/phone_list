# open

sudo iptables -D DOCKER-USER 2
sudo iptables -D DOCKER-USER 1
sudo netfilter-persistent save

# close

sudo iptables -I DOCKER-USER 1 -s 10.166.25.182 -p tcp --dport 80 -j RETURN
sudo iptables -I DOCKER-USER 2 -p tcp --dport 80 -j DROP
sudo netfilter-persistent save

# check 

curl -I --connect-timeout 3 http://server:port