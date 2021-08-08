pragma solidity ^0.4.23;

contract RealEstate {
// [================================================== 주문자 구조체================================================]    
    struct Buyer{ // 구매자 정보를 프론트앤드에 표출하기위한 구조체
        address buyerAddress;
        bytes32 name;
        uint age;
    }
    mapping (uint => Buyer) public buyerInfo; // 구매자 정보를 표출하기 위한 매핑


// [================================================== 객체와 변수들 ================================================]    
    
    address public owner;
     // public을 붙히면 게터 함수 실행
    // 스마트 컨트렉트 [생성자] -> 배포할때 한번만 실행 그 이후로는 호출x (그 이점을 살려 소유자로 설정)
    // 배포할때 사용된 계정이 스마트 컨트랙트의 (소유자)
    address[10] public buyers;

// [================================================== 이벤트 함수 ================================================]    
    event LogBuyRealEstate(
        address _buyer,
        uint _id
    );

// [================================================== 생성자================================================]
    constructor() public{
        owner = msg.sender; 
        //컨트랙트를 배포할때 어떤 계정을  이용해 배포
        // msg.sender 의 주소값을 owner에 대입
        // 현재 사용하고 있는 계정으로 컨트랙 내부 함수, 변수를 불러오는 역할(값은 주소형)
    }
    

// [================================================== 매물구입 함수================================================]
    //매개변수: 매입자 아이디, 매입자 이름, 매입자 나이
    //payable -> 함수가 이더를 받을때사용
    function buyRealEstate(uint _id, bytes32 _name, uint _age) public payable{
        require(_id >= 0 && _id <=9); //_id가 0과 10 사이인지 확인
        buyers[_id] = msg.sender;
        buyerInfo[_id] = Buyer(msg.sender, _name, _age); //구매자 정보를 이동하기 위함

        owner.transfer(msg.value); //계정에서 계정으로 값을 이동하기 위함 -> Wei값만 가능
        emit LogBuyRealEstate(msg.sender, _id); //매입자 생길때 이벤트 발생시킨다는 명령어
    }

// [================================================== 구매자 정보 표출 함수================================================]
// 읽기전용함수라서 가스비가 안든다 -> view 선언시 읽기 전용 함수

    function getBuyerInfo(uint _id) public view returns (address, bytes32, uint){ // 매물 아이디를 받는다. 가시성은 view. 리턴값들(바이어 구조체의 값들과 매칭시킨것)
    Buyer memory buyer = buyerInfo[_id];
    return (buyer.buyerAddress, buyer.name, buyer.age);

    }

    // 바이어 구조체를 리턴하는 함수
    //10인 이유는 바이어 구조체가 10으로 고정되어 있기때문
    function getAllBuyers() public view returns (address[10]) {
        return buyers;
    }

}
