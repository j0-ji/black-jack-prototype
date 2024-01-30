'use strict';

class Dealer {
    constructor(_deckCount) {
        this.deckCount = _deckCount;
        this.deck = [];
        this.currentIndex = 0
        this.#createDeck();
    }

    #createDeck() {
        for( let d = 0; d < this.deckCount; d++) {
            for(let i = 0x1; i < 0xF; i++) {
                if(i < 0xA) {
                    this.#addCards(i)
                } else {
                    switch (i) {
                        case 0xA: {
                            this.#addCards("A");
                            break;
                        }
                        case 0xB: {
                            this.#addCards("B");
                            break;
                        }
                        case 0xD: {
                            this.#addCards("D");
                            break;
                        }
                        case 0xE: {
                            this.#addCards("E");
                            break;
                        }
                    }
                }
            }
        }
    }

    #addCards(i) {
        this.deck.push("&#x1F0A" + i + ";");
        this.deck.push("&#x1F0B" + i + ";");
        this.deck.push("&#x1F0C" + i + ";");
        this.deck.push("&#x1F0D" + i + ";");
    }

    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = this.deck[i];
            this.deck[i] = this.deck[j];
            this.deck[j] = temp;
        }
        this.currentIndex = 0
    }

    dealCard() {
        this.currentIndex++;
        document.getElementById("display").innerHTML = this.deck[this.currentIndex - 1];
        return this.deck[this.currentIndex - 1];
    }

    printDeck() {
        document.getElementById("display").innerText = this.deck.toString();
    }
}

let dealer;

window.onload = () => {
    dealer = new Dealer(1);
    dealer.shuffleDeck();
}

