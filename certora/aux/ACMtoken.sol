pragma solidity ^0.8.0;

import "../../src/@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "../../src/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../../src/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ACMtoken is ERC20{
    string tokenName = "professor_salva_a_gente_da_final";
    string tokenSymbol = "ACM";
    constructor() ERC20(tokenName,tokenSymbol){
    }

    function balanceOfACM(address account) public view returns (uint256)  {
        return ERC20.balanceOf(account);
    }
    
}