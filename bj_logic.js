'use strict';

class Dealer {
    constructor(_deckCount) {
        this.deckCount = _deckCount;
        this.deck = [];
        this.currentIndex = 0
        this.#createDeck();
        this.hand = new Hand();
        this.handTag = document.getElementById("dealerHand");
    }

    #createDeck() {
        for( let d = 0; d < this.deckCount; d++) {
            for(let i = 0x1; i < 0xF; i++) {
                if(i < 0xA) {
                    this.#addCards(i, i)
                } else {
                    switch (i) {
                        case 0xA: {
                            this.#addCards(10, "A");
                            break;
                        }
                        case 0xB: {
                            this.#addCards(10, "B");
                            break;
                        }
                        case 0xD: {
                            this.#addCards(10, "D");
                            break;
                        }
                        case 0xE: {
                            this.#addCards(10, "E");
                            break;
                        }
                    }
                }
            }
        }
    }

    #addCards(_value, _index) {
        this.deck.push(new Card(_value, "<mark class='black'>&#x1F0A" + _index + ";</mark>"));
        this.deck.push(new Card(_value, "<mark class='red'>&#x1F0B" + _index + ";</mark>"));
        this.deck.push(new Card(_value, "<mark class='red'>&#x1F0C" + _index + ";</mark>"));
        this.deck.push(new Card(_value, "<mark class='black'>&#x1F0D" + _index + ";</mark>"));
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
        return this.deck[this.currentIndex - 1];
    }
}

class Table {
    constructor(_dealer) {
        this.dealer = _dealer;
        this.playerCount = prompt("Player count: ", '');;
        this.players = [];
        this.currentPlayer = 0;
        this.#createPlayers();
    }

    #createPlayers() {
        let playersTag = document.getElementById("players");

        for(let i = 0; i < this.playerCount; i++) {
            let name = prompt('Player' + (i+1) + ' name:', '');
            let id = "player" + (i);
            this.players.push(new Player(id, name));
            playersTag.appendChild(this.#createPlayerUI(this.players[i]));
        }
    }

    #createPlayerUI (_player) {
        console.log(_player)
        let main = document.createElement("div");

        let name = document.createElement("h1");
        let hand = document.createElement("p");
        let bet = document.createElement("p");

        let buttons = document.createElement("div");
        let btn_hold = document.createElement("div");
        let btn_give = document.createElement("div");
        let btn_take = document.createElement("div");

        let coins = document.createElement("div");
        let coin50 = document.createElement("div");
        let coin100 = document.createElement("div")
        let coin500 = document.createElement("div");

        let credit = document.createElement("p");

        _player.mainTag = main;
        _player.handTag = hand;
        _player.creditTag = credit;
        _player.betTag = bet;

        main.classList.add("player");
        main.id = _player.id;
        main.appendChild(hand);
        main.appendChild(bet);
        main.appendChild(name);
        main.appendChild(buttons);
        main.appendChild(coins);
        main.appendChild(credit);

        hand.id = _player.id + "-hand";
        hand.classList.add("player-hand");

        bet.id = _player.id + "-bet";
        bet.classList.add("bet");
        bet.title = "Your money. Click to reset!"
        bet.addEventListener("click", () => {
            if (!_player.isReady) {
                _player.credit += _player.bet;
                _player.bet = 0;
                credit.innerHTML = _player.credit;
                bet.innerHTML = _player.bet;
            }
        });

        name.innerHTML = _player.name;
        name.classList.add("player-name");

        buttons.classList.add("buttons");
        buttons.appendChild(btn_hold);
        buttons.appendChild(btn_give);
        buttons.appendChild(btn_take);

        btn_hold.innerHTML = "hold";
        btn_hold.classList.add("button");
        btn_hold.addEventListener("click", () => {
            if (_player.awaitAction) {
                main.classList.remove("player-active");
                _player.awaitAction = false;
                this.#nextPlayer();
            }
        });

        btn_give.innerHTML = "give";
        btn_give.classList.add("button");
        btn_give.addEventListener("click", () => {
            if (!_player.isReady) {
                _player.isReady = true;
                let counter = 0;
                for (let player of this.players) {
                    if (player.isReady) {
                        counter++;
                    }
                }
                if (counter === this.players.length) {
                    // START GAME HERE
                    this.gameRunning = true;
                    this.#initGame();
                }
            }
        });

        btn_take.innerHTML = "take";
        btn_take.classList.add("button");
        btn_take.addEventListener("click", () => {
            if (_player.awaitAction) {
                _player.hand[0].cards.push(this.dealer.dealCard());

                _player.handTag.innerHTML = _player.hand[0].getValue() + "\t" + _player.hand[0].getAllCards();

                if (_player.hand[0].getNumericValue() > 21) {
                    main.classList.remove("player-active");
                    main.classList.add("player-loose")
                    _player.awaitAction = false;

                    this.#nextPlayer();
                }
            }
        });

        coins.classList.add("buttons");
        coins.appendChild(coin50);
        coins.appendChild(coin100);
        coins.appendChild(coin500);

        coin50.innerHTML = "50";
        coin50.classList.add("coin");
        coin50.addEventListener("click", () => {
            if (!_player.isReady) {
                this.#updateCreditAndBet(_player, 50);
                this.#updateCreditAndBetUI(_player);
            }
        });

        coin100.innerHTML = "100";
        coin100.classList.add("coin");
        coin100.addEventListener("click", () => {
            if (!_player.isReady) {
                this.#updateCreditAndBet(_player, 100);
                this.#updateCreditAndBetUI(_player)
            }
        });

        coin500.innerHTML = "500";
        coin500.classList.add("coin");
        coin500.addEventListener("click", () => {
            if (!_player.isReady) {
                this.#updateCreditAndBet(_player, 500);
                this.#updateCreditAndBetUI(_player);
            }
        });

        credit.innerHTML = _player.credit;
        credit.classList.add("credit");

        return main;
    }

    #updateCreditAndBet(_player, _amount) {
        _player.credit -= _amount;
        _player.bet += _amount;
    }
    #updateCreditAndBetUI(_player) {
        _player.betTag.innerHTML = _player.bet;
        _player.creditTag.innerHTML = _player.credit;
    }

    #initGame() {
        let timeoutVal = 800;

        this.#dealCards();
        console.log(this)
        this.#displayDealtCards(timeoutVal);

        setTimeout(() => {
            this.currentPlayer = this.players.length - 1;
            let firstPlayer = this.players[this.currentPlayer];
            firstPlayer.mainTag.classList.add("player-active");
            firstPlayer.awaitAction = true;
        }, timeoutVal * this.players.length * 2 + timeoutVal * 4)
    }

    #dealCards() {
        this.#cardForEveryPlayer();
        this.dealer.hand.cards.push(this.dealer.dealCard());
        this.#cardForEveryPlayer();
        this.dealer.hand.cards.push(this.dealer.dealCard());
        console.log("Cards dealt!");
    }

    #cardForEveryPlayer() {
        for (let player of this.players) {
            player.hand[0].cards.push(this.dealer.dealCard());
        }
    }

    #displayDealtCards(_timeoutVal) {
        for (let i = this.players.length-1; i >= 0; i--) {
            setTimeout(() => {
                this.players[i].handTag.innerHTML = this.players[i].hand[0].getFirstCardValue() + "\t" + this.players[i].hand[0].getFirstCard();
            }, _timeoutVal * (this.players.length - i));
        }

        setTimeout(() => {
            this.dealer.handTag.innerHTML = this.dealer.hand.getPlaceholder(1);
        }, _timeoutVal * this.players.length + _timeoutVal);

        setTimeout(() => {
            for (let i = this.players.length-1; i >= 0; i--) {
                setTimeout(() => {
                    this.players[i].handTag.innerHTML = this.players[i].hand[0].getValue() + "\t" + this.players[i].hand[0].getAllCards();
                }, _timeoutVal * (this.players.length - i));
            }
        }, _timeoutVal * this.players.length + _timeoutVal)

        setTimeout(() => {
            this.dealer.handTag.innerHTML = this.dealer.hand.getPlaceholder(2);
        }, _timeoutVal * this.players.length * 2 + _timeoutVal * 2);

        setTimeout(() => {
            this.dealer.handTag.innerHTML = this.dealer.hand.getFirstCardValue() + "\t" + this.dealer.hand.getFirstCardWithPlaceholder();
        }, _timeoutVal * this.players.length * 2 + _timeoutVal * 3);
    }

    #nextPlayer() {
        this.currentPlayer--;
        if (this.currentPlayer !== -1) {
            let nextPlayer = this.players[this.currentPlayer];
            nextPlayer.mainTag.classList.add("player-active");
            nextPlayer.awaitAction = true;
        } else {
            let index = 0;
            let timeout = 800;

            this.dealer.handTag.innerHTML = this.dealer.hand.getNumericValue() + "\t" + this.dealer.hand.getAllCards();

            const dealDealerHand = () => {
                if (this.dealer.hand.getNumericValue() < 17) {
                    setTimeout(() => {
                        this.dealer.hand.cards.push(this.dealer.dealCard());
                        this.dealer.handTag.innerHTML = this.dealer.hand.getNumericValue() + "\t" + this.dealer.hand.getAllCards();
                        dealDealerHand();
                    }, timeout)
                }
            }

            dealDealerHand();

            setTimeout(() => {
                this.#payMoney();
            }, timeout * 8);

            setTimeout(() => {
                this.#resetTable();
            }, timeout * 10);
        }
    }

    // TODO: Ausschüttung funktioniert noch nicht korrekt!
    #payMoney() {
        for (let player of this.players) {
            let playerValue = player.hand[0].getNumericValue();
            let dealerValue = this.dealer.hand.getNumericValue();

            const basicCheck = () => {
                if (playerValue === 21 && player.hand[0].cards.length === 2) {
                    alert("Player " + player.name + " got a BLACK JACK!");
                    player.credit += player.bet * 2.5;
                } else if (playerValue <= 21) {
                    player.credit += player.bet * 2;
                }
            }

            if (dealerValue > 21 ) {
                basicCheck();
            } else if (dealerValue <= 21 && this.dealer.hand.cards.length) {
                if (playerValue > dealerValue) {
                    basicCheck();
                } else if (playerValue === dealerValue) {
                    player.credit += player.bet;
                }
            } else if (dealerValue === 21 && this.dealer.hand.cards.length === 2) {
                if (playerValue === 21 && player.hand[0].length === 2) {
                    player.credit += player.bet;
                }
            }
            player.bet = 0;
            this.#updateCreditAndBetUI(player);
        }
    }

    #resetTable() {
        this.dealer.hand.cards = [];
        this.dealer.handTag.innerHTML = "";

        for (let player of this.players) {
            player.handTag.innerHTML = "";
            player.hand[0].cards = [];
            try {
                player.mainTag.classList.remove("player-active");
            } catch (ignored) {}
            try {
                player.mainTag.classList.remove("player-loose");
            } catch (ignored) {}
            player.isReady = false;
        }
    }
}

class Player {
    constructor(_id, _name) {
        this.id = _id;
        this.credit = 1000;
        this.bet = 0;
        this.name = _name;
        this.hand = [];
        this.hand.push(new Hand());
        this.mainTag = null;
        this.handTag = null;
        this.creditTag = null;
        this.betTag = null;
        this.isReady = false;
        this.awaitAction = false;
    }
}

class Card {
    constructor(_value, _html) {
        this.value = _value;
        this.html = _html;
    }
}

class Hand {
    constructor() {
        this.cards = [];
        this.placeholder = "<mark class='blue'>&#x1F0A0;</mark>";
    }

    getFirstCardValue() {
        if (this.cards[0].value === 1) {
            return "<mark class='size-value'>" + 11 + "</mark>";
        }
        return "<mark class='size-value'>" + this.cards[0].value + "</mark>";
    }

    getValue() {
        let value = 0
        for (let card of this.cards) {
            if (card.value === 1 && value <= 10) {
                value += 11;
            } else {
                value += card.value;
            }
        }
        return "<mark class='size-value'>" + value + "</mark>";
    }

    getNumericValue() {
        let value = 0
        for (let card of this.cards) {
            if (card.value === 1 && value <= 10) {
                value += 11;
            } else {
                value += card.value;
            }
        }
        return value;
    }

    getFirstCard() {
        return this.cards[0].html;
    }

    getAllCards() {
        let str = "";
        for (let card of this.cards) {
            str += card.html;
        }
        return str;
    }

    // The following methods should be only used for the dealer
    getFirstCardWithPlaceholder() {
        return this.cards[0].html + this.placeholder;
    }

    getPlaceholder(_amount) {
        let str = "";
        for( let i = 0; i < _amount; i++) {
            str += this.placeholder;
        }
        return str;
    }
}

window.onload = () => {
    let dealer = new Dealer(1);
    dealer.shuffleDeck();

    let table = new Table(dealer, 2);
}

