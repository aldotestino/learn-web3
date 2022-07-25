// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8; // versione di solidity

// definisco un contratto
contract SimpleStorage {
    // tipi di dato: bool, uint, int, address, bytes, string, array, struct

    // creazione tipo
    struct Person {
        uint256 favouriteNumber;
        string name;
    }

    // array di oggetti di tipo `Person`, `public`: non c'è bisogno di definire
    // una funzione getter
    Person[] public people; // dynamic array, non ha una lunghezza fissa

    // mappa o dizionario che ha come chiave una stringa e valore un numero
    mapping(string => uint256) public nameToFavouriteNumber;

    // creazione variabile
    uint256 favouriteNumber; // iniziallizato con 0

    // questa funzione modifica lo stato della blockchain (transazione)
    // si spende "gas" per essere eseguita
    function store(uint256 _favouriteNumber) public {
        favouriteNumber = _favouriteNumber;
    }

    // questa funzione ritorna lo stato
    // con la keyword `view` non si spende "gas"
    // Si può evitare questa funzione rendendo `public` la variabile
    // `uint256 public favouriteNumber`
    function retrieve() public view returns (uint256) {
        return favouriteNumber;
    }

    // questa funzione nè modifica lo stato, nè lo ritorna
    // con la keyword `pure` non si spende "gas"
    function randomMath() public pure returns (uint256) {
        return (1 + 1);
    }

    // `memory` avanti a `_name` è necessario, indica una variabile
    // temporanea che può essere modificata
    // `calldata` indica una variabile temporanea che non può essere modificata
    // queste due keyword devono essere usate solo su tipi array (quindi acnche string),
    // struct o mapping
    function addPerson(string memory _name, uint256 _favouriteNumber) public {
        people.push(Person({favouriteNumber: _favouriteNumber, name: _name}));
        nameToFavouriteNumber[_name] = _favouriteNumber;
    }
}
