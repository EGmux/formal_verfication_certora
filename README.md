# formal_verfication_certora(name subject to change)

# how to run you first spec

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
certoraRun src/ERC20Fixed.sol --verify ERC20Fixed:specs/ERC20Fixed.spec
```

