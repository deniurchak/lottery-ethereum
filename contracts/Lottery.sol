pragma solidity ^0.8.28;

contract Lottery {
    address public manager;
    address[] public players;
    uint64 public enterPrice = .01 ether; 

    constructor() {
        manager = msg.sender;
    } 

    function enter() public payable {
        require(msg.value > enterPrice, "not enough money");
        players.push(msg.sender);
    }

    function random() private view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.prevrandao, block.timestamp, players)));
    }

    function pickWinner() public restricted {
        uint256 index = random() % players.length;
        address payable winner = payable(players[index]);
        winner.transfer(address (this).balance);
        players = new address[](0);
    }

    modifier restricted() {
        require(msg.sender == manager, "you are not authorized to pick winner");
        _;
    }

    function getPlayers() public view returns (address[] memory) {
        return players;
    }
} 