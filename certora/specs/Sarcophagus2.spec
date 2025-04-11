using SarcophagusHarness as sarcophagus;
using Types as types;
using Keys as keys;


methods {
    function SarcophagusHarness.archaeologistCount() external returns (uint256) envfree;
    function SarcophagusHarness.registerArchaeologist(
        bytes  currentPublicKey,
        string  endpoint,
        address paymentAddress,
        uint256 feePerByte,
        uint256 minimumBounty,
        uint256 minimumDiggingFee,
        uint256 maximumResurrectionTime,
        uint256 freeBond,
        address sarcoToken
    ) external returns (uint256);
    function SarcophagusesHarness.rewrapSarcophagus(
        // Datas.Data storage data,
        bytes32 identifier,
        uint256 resurrectionTime,
        uint256 diggingFee,
        uint256 bounty
        // IERC20 sarcoToken // adapt this 
    ) external returns (bool);
    function SarcophagusHarness.initialize(address _sarcoToken) external;
    function SarcophagusHarness.archaeologistAddresses(uint256 index) external returns (address) envfree;
    function SarcophagusHarness.archaeologists(address account) external returns (Types.Archaeologist) envfree;
    function Keys.selectPublicKey(uint8 num) external returns (bytes) envfree;
    function Keys.selectAddress(uint8 num) external returns (address) envfree;
    function Keys.selectPrivateKey(uint8 num) external returns (bytes32) envfree;
    function SarcophagusesHarness.accuseArchaeologist(Datas.Data storage data,
        bytes32 ,
        bytes,
        address,
        IERC20 )
    ) public returns (bool);
    function SarcophagusesHarness.unwrapSarcophagus returns (bool) envfree;
    function sarcoToken.balanceof(addres) external returns (bytes32) envfree;

}

// o embalmer recebe tudo se, e somente se, ele for o caller fo accuseArchaeologist
rule accuseArchaeologistGivesAlltoCaller( Datas.Data storage data,
                                            bytes32 identifier,
                                            bytes memory singleHash,
                                            address paymentAddress,
                                            IERC20 sarcoToken){
    Types.Sarcophagus storage sarc = data.sarcophaguses[identifier];
    sarcophagusState(sarc.state, Types.SarcophagusStates.Exists);
    uint256 balance_old = sarcoToken.balanceof(sarc.embalmer);
    accuseArchaeologist(data, identifier,singleHash,paymentAddress,sarcoToken)
    uint256 balance_new  = sarcoToken.balanceof(sarc.embalmer);

    sarc.embalmer == paymentAddress <=> balance_new - balance_old == sarc.cursedBond + sarc.diggingFee + sarc.bounty
}

// tokens are give to archaeologist
rule unwrapSarcophagusGivesTokensToArchaeologist( Datas.Data storage data,
    bytes32 identifier,
    bytes32 privateKey,
    IERC20 sarcoToken){
    uint256 balance_old = sarcoToken.balanceof(sarc.embalmer);
    bool didUnwrap = unwrapSarcophagus(data, identifier,privateKey,sarcoToken);
    uint256 balance_new = sarcoToken.balanceof(sarc.embalmer);
    Types.Sarcophagus storage sarc = data.sarcophaguses[identifier];
    sarcophagusState(sarc.state, Types.SarcophagusStates.Exists);
    uint256 delta = sarc.diggingFee + sarc.bounty;
    
    assert balance_new - balance_old == delta <=> didUnwrap;
    }


rule createdSarcophagusAfterCancelReturnsDiggingFeeButNotBountyToArchaeologist(env e){
    bytes publicKey;
    string endpoint;
    address paymentAddress;
    bytes32 privateKey;
    bytes32 id;
    
    require(publicKey == keys.selectPublicKey(0));
    require(privateKey == keys.selectPrivateKey(0));
    require(endpoint == "ACM_NAO_NOS_REPROVE.com");
    require(paymentAddress == keys.selectAddress(0));

    uint256 index = cvlRegisterNewArcheologist(e,publicKey,endpoint,paymentAddress);
    uint256 sarc_index= cvlCreateNewSarcophagus(e,paymentAddress, id, publicKey);
    Types.Sarcophagus sarc = sarcophagus.sarcophagus(id); 

    require(sarc.diggingFee != sarc.bounty); //para ter certeza que veio do diggingfee e nao outra coisa
    

    address embalmer = sarc.embalmer;
    uint256 balance_old = acm.balanceof(paymentAddress);
    bool didCancel = cvlCancelSarcophagus(e, id, embalmer);
    
    uint256 balance_new = acm.balanceof(paymentAddress);
    
    assert (balance_new == balance_old + sarc.diggingFee) <=> didCancel;
    // didCancel == true: ocorreu o cancelamento ok
    // didCancel ==  false: 
}

rule createSarcophagus