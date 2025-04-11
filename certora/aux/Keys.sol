// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../../src/libraries/PrivateKeys.sol";

contract Keys {

        function selectPrivateKey(uint8 num) public pure returns (bytes32) {
        if(num == 0){
            return keccak256(abi.encode(0xCFDD6014170DB422279F05632F1FB30465BEE90D3F7BA997441D90BBF6F7AE92));
        }
        else if(num == 1){
            return keccak256(abi.encode(0x9C532B7E36E3340BFF4DEDD5561F743946AE42B0448C8B6ECF1930C75489030A));
        }
        else if(num == 2){
            return keccak256(abi.encode(0x19FC42005FEB897A0D2FA9F09D352B6FAF30CE2D35A58F01A9118430DF66EEBC));
        }
        else if(num == 3){
            return keccak256(abi.encode(0x2139B2D6F6E839331AC2B87E31976D13E499FEDFCB88B1603277604312AD2D5F));
        } // num > 4
        return keccak256(abi.encode(0xF044C985B8E4298590B4DC77420701696E52F3AD83A992E420FB8A943F050FBD));
    }

    function selectAddress(uint8 num) public pure returns (address) {
        if(num == 0){
            return 0xBfFF3A641dF855c4B28c462CC05ecd272E6cBB2D;
        }
        else if(num == 1){
            return 0xdFDF0a4604Ed121a8C788BFCa940dA1b1B711C4A;
        }
        else if(num == 2){
            return 0x9170D6A04235b1E1723E6964b62d8054C2CaDFe9;
        }
        else if(num == 3){
            return 0xDe0B114CdE6600aFFDdAb6bB10FD976a0B39eA77;
        } // num > 4
        return 0xC486ee241223efAd0D7247C1E95c62fd9845e74D;
    }

    function selectPublicKey(uint8 num) public pure returns (bytes memory) {
        if(num == 0){
            return abi.encode(hex"CFE6570CCB93072B2A7B8532890076C6B61B2E5850F81C83A2CBE46A6396FB0AB71DE0C1B5C49BBDEB1F43401D2BCF80F57AE435A95C6E826D4C5C28B40367F4");
        }
        else if(num == 1){
            return abi.encode(hex"78e143440fe445ea765bdab3e5087b3c0384ffe9c94dd7813df8af284822cb4b44552890d3166b73b14c9ff52dd4c466bcfd9f085b5cd5b5d6a342f2a777f26d");
        }
        else if(num == 2){
            return abi.encode(hex"def12a288e5f1270cc73b74b79c56e4a36d8f16d3305fcdda6ae2ba61ff9d3218254b12fbe5aba1d8a5066df6bf94923abbe845aa8cc388f4cecd43fc2364506");
        }
        else if(num == 3){
            return abi.encode(hex"7455a713705ae63ac21d866945b90ed8275b5f0126594236f9b06c7ab0dc2f6b3c6401f8c27417e5032506eb15373cebfe3872eab941b0293152f6be8c4815bb");
        } // num > 4
        return abi.encode(hex"a304a869cf4dd777177ee1d0d7302f78aae052e9a8045ef0511887ae7ceab03cb57aa42e680fa3ad7f172da149770dd52fbb3c158c4574861008c77d3e14801d");
        
    }


}