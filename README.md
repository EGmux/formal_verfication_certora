# formal_verfication_certora(name subject to change)

# how to run the spec

- install docker

[guide on installing docker](https://docs.docker.com/engine/install/)

- docker requires the user in the docker group if running as non root

```bash
sudo groupadd docker
sudo usermod -aG docker $USER
```
- logout and login again or reboot the system
- provide you certora key in bootstrap.sh
- run the bootstrap script
```bash
chmod +x ./bootstrap.sh
./bootstrap.sh
```
- run the following command inside the container
```bash
certoraRun /project/conf/sarcophagus.conf --optimistic_hashing
```

- you can also run the following commands to install another version of the solidity compiler(solc), the default is v0.8.0

```bash
solc-select install 0.8.1
solc-select use 0.8.1 
```
