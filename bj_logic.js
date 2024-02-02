'use strict';

// DONE: if dealer has ace, check if he has a 10. If so, quit round -> players loose
// DONE: if player has set 0 bet -> dont deal cards to him
    // DONE: move isPassing()-function to the player itself (as a bool) instead of a func in hand
// DONE: display visually if a button is active or inactive
// TODO: add "split" option if hand has 2 cards with same value

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

                    if (i === 0x1) {
                        this.#addCards(i, i)
                        this.#addCards(i, i)
                        this.#addCards(i, i)
                        this.#addCards(i, i)
                        this.#addCards(i, i)
                    }
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
        let mix = () => {
            for (let i = this.deck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const temp = this.deck[i];
                this.deck[i] = this.deck[j];
                this.deck[j] = temp;
            }
            this.currentIndex = 0
        }

        let splitMix = () => {
            const chunk1 = this.deck.slice(0, this.deck.length / 2);
            const chunk2 = this.deck.slice(this.deck.length / 2, this.deck.length);

            this.deck = [];

            while (chunk1.length !== 0) {
                this.deck.push(chunk1.pop());
                this.deck.push(chunk2.pop());
            }
        }

        mix();
        splitMix();
        mix();
    }

    dealCard() {
        this.currentIndex++;
        console.log(this.currentIndex);
        return this.deck[this.currentIndex - 1];
    }
}

class Table {
    constructor(_dealer) {
        this.dealer = _dealer;
        this.playerCount = prompt("Player count: ", '');
        this.players = [];
        this.playersPassing = 0;
        this.currentPlayer = 0;
        this.timeoutVal = 850;
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
        let main = document.createElement("div");

        let name = document.createElement("h1");
        let hand = document.createElement("p");
        let bet = document.createElement("p");

        let buttons = document.createElement("div");
        let btn_hold = new Button(document.createElement("div"), "button");
        let btn_place = new Button(document.createElement("div"), "button");
        let btn_take = new Button(document.createElement("div"), "button");

        let coins = document.createElement("div");
        let coin50 = new Button(document.createElement("div"), "coin");
        let coin100 = new Button(document.createElement("div"), "coin");
        let coin500 = new Button(document.createElement("div"), "coin");

        let credit = document.createElement("p");

        _player.mainTag = main;
        _player.handTag = hand;
        _player.creditTag = credit;
        _player.betTag = bet;
        _player.buttonsBet = [btn_place, coin50, coin100, coin500];
        _player.buttonsGame = [btn_take, btn_hold];

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
        buttons.appendChild(btn_hold.element);
        buttons.appendChild(btn_place.element);
        buttons.appendChild(btn_take.element);

        btn_hold.element.innerHTML = "hold";
        btn_hold.element.classList.add("button");
        btn_hold.element.addEventListener("click", () => {
            if (_player.awaitAction && !_player.isPassing) {
                main.classList.remove("player-active");
                _player.awaitAction = false;
                this.#nextPlayer();
            }
        });

        btn_place.element.innerHTML = "place";
        btn_place.element.classList.add("button");
        btn_place.element.addEventListener("click", () => {
            if (!_player.isReady) {
                _player.isReady = true;

                main.classList.add("player-ready");

                this.#toggleButtons(_player.buttonsBet);

                let counter = 0;
                for (let player of this.players) {
                    if (player.isReady) {
                        counter++;
                    }
                }

                if (_player.bet === 0) {
                    _player.isPassing = true;
                    this.playersPassing++;
                }

                if (counter === this.players.length) {
                    setTimeout(() => {
                        for (let player of this.players) {
                            player.mainTag.classList.remove("player-ready");
                        }
                    }, 1000);

                    // START GAME HERE
                    this.#initGame();
                }
            }
        });

        btn_take.element.innerHTML = "hit";
        btn_take.element.classList.add("button");
        btn_take.element.addEventListener("click", () => {
            if (_player.awaitAction && !_player.isPassing) {
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
        coins.appendChild(coin50.element);
        coins.appendChild(coin100.element);
        coins.appendChild(coin500.element);

        let highlightBroke = (_amount, _button) => {
            let hasMoney = this.#updateCreditAndBet(_player, _amount);

            if (!hasMoney) {
                _button.element.classList.add("broke");
                _button.element.classList.remove("coin-active");
                setTimeout(() => {
                    _button.element.classList.add("coin-active")
                    _button.element.classList.remove("broke");
                }, 500);
            } else {
                this.#updateCreditAndBetUI(_player);
            }
        }

        coin50.element.innerHTML = "50";
        coin50.element.classList.add("coin");
        coin50.element.addEventListener("click", () => {
            if (!_player.isReady) {
                highlightBroke(50, coin50);
            }
        });

        coin100.element.innerHTML = "100";
        coin100.element.classList.add("coin");
        coin100.element.addEventListener("click", () => {
            if (!_player.isReady) {
                highlightBroke(100, coin100);
            }
        });

        coin500.element.innerHTML = "500";
        coin500.element.classList.add("coin");
        coin500.element.addEventListener("click", () => {
            if (!_player.isReady) {
                highlightBroke(500, coin500);
            }
        });

        credit.innerHTML = _player.credit;
        credit.classList.add("credit");

        this.#toggleButtons(_player.buttonsGame);

        return main;
    }

    #updateCreditAndBet(_player, _amount) {
        if (_player.credit >= _amount) {
            _player.credit -= _amount;
            _player.bet += _amount;
            return true;
        } else {
            return false;
        }
    }

    #updateCreditAndBetUI(_player) {
        _player.betTag.innerHTML = _player.bet;
        _player.creditTag.innerHTML = _player.credit;
    }

    #initGame() {
        this.#dealCards();
        this.#displayDealtCards();

        let proceedWithoutBlackJack = () => {
            // set the current player to the last of the array | equals the most left player from  dealer-view
            this.currentPlayer = this.players.length - 1;

            // if player is passing, skip him
            if (this.players[this.currentPlayer].isPassing) {
                this.currentPlayer--;
            }

            let firstPlayer = this.players[this.currentPlayer];
            firstPlayer.mainTag.classList.add("player-active");
            firstPlayer.awaitAction = true;
            this.#toggleButtons(firstPlayer.buttonsGame);
        }

        // wait while cards got displayed
        setTimeout(() => {
            // if changing this change "animate-peek"-time in css
            // difference of at least 300ms, js having the longer time in ms, so animation seems more natural
            let peekTimeout = 1800;

            // if the dealer has an ace or 10 -> peek
            if (this.dealer.hand.cards[0].value === 1 || this.dealer.hand.cards[0].value === 10) {
                // add peeking-animation
                document.getElementById("animate-peek").classList.add("animate-peek");
                setTimeout(() => {
                    // if dealer has BlackJack -> quit round
                    if (this.dealer.hand.getNumericValue() === 21 && this.dealer.hand.cards.length === 2) {
                        // show dealer-hand (turn 2nd card)
                        this.dealer.handTag.innerHTML = this.dealer.hand.getValue() + "\t" + this.dealer.hand.getAllCards();
                        setTimeout(() => {
                            // check if players would lose money
                            this.#payMoney();
                            setTimeout(() => {
                                // Reset the table and begin new round
                                this.#resetTable();
                            }, this.timeoutVal * 5);
                        }, this.timeoutVal)
                    }
                    // else proceed the game normally
                    else {
                        proceedWithoutBlackJack();
                    }
                }, peekTimeout)
            } else {
                proceedWithoutBlackJack()
            }
        }, this.timeoutVal * this.players.length * 2 + this.timeoutVal * 4 - this.timeoutVal * this.playersPassing)
    }

    #dealCards(){
        this.#cardForEveryPlayer();
        this.dealer.hand.cards.push(this.dealer.dealCard());
        this.#cardForEveryPlayer();
        this.dealer.hand.cards.push(this.dealer.dealCard());
    }

    #cardForEveryPlayer() {
        for (let player of this.players) {
            if (player.bet > 0) {
                player.hand[0].cards.push(this.dealer.dealCard());
            }
        }
    }

    #displayDealtCards() {
        for (let i = this.players.length-1; i >= 0; i--) {
            setTimeout(() => {
                if (!this.players[i].isPassing) {
                    this.players[i].handTag.innerHTML = this.players[i].hand[0].getFirstCardValue() + "\t" + this.players[i].hand[0].getFirstCard();
                } else {
                    this.players[i].handTag.innerHTML = "<mark class='size-value'>PASS</mark>";
                }
            }, this.timeoutVal * (this.players.length - i));
        }

        setTimeout(() => {
            this.dealer.handTag.innerHTML = this.dealer.hand.getPlaceholder(1);
        }, this.timeoutVal * this.players.length + this.timeoutVal);

        setTimeout(() => {
            for (let i = this.players.length-1; i >= 0; i--) {
                if (!this.players[i].isPassing) {
                    setTimeout(() => {
                        this.players[i].handTag.innerHTML = this.players[i].hand[0].getValue() + "\t" + this.players[i].hand[0].getAllCards();
                    }, this.timeoutVal * (this.players.length - i));
                }
            }
        }, this.timeoutVal * this.players.length + this.timeoutVal)

        setTimeout(() => {
            this.dealer.handTag.innerHTML = this.dealer.hand.getPlaceholder(2);
        }, this.timeoutVal * this.players.length * 2 + this.timeoutVal * 2 - this.timeoutVal * this.playersPassing);

        setTimeout(() => {
            this.dealer.handTag.innerHTML = this.dealer.hand.getFirstCardValue() + "\t" + this.dealer.hand.getFirstCardWithPlaceholder();
        }, this.timeoutVal * this.players.length * 2 + this.timeoutVal * 3 - this.timeoutVal * this.playersPassing);
    }

    #nextPlayer() {
        // deactivate the buttons of the previous player
        this.#toggleButtons(this.players[this.currentPlayer].buttonsGame);

        // update index to current player
        this.currentPlayer--;

        // if the now current player is passing, skip him
        // try-catch because this.currentPlayer could be <0
        try{
            if (this.players[this.currentPlayer].isPassing) {
                this.currentPlayer--;
            }
        } catch (ignored) {}

        // check if previous player was actually the last one
        if (this.currentPlayer !== -1) {
            let currentPlayer = this.players[this.currentPlayer];
            // activate css for the active player
            currentPlayer.mainTag.classList.add("player-active");
            // activate the game-buttons of the current player
            this.#toggleButtons(currentPlayer.buttonsGame);
            // await action of current player
            currentPlayer.awaitAction = true;
        } else {
            setTimeout(() => {
                this.dealer.handTag.innerHTML = this.dealer.hand.getNumericValue() + "\t" + this.dealer.hand.getAllCards();
            }, this.timeoutVal);

            const dealDealerHand = () => {
                if (this.dealer.hand.getNumericValue() < 17) {
                    setTimeout(() => {
                        this.dealer.hand.cards.push(this.dealer.dealCard());
                        this.dealer.handTag.innerHTML = this.dealer.hand.getNumericValue() + "\t" + this.dealer.hand.getAllCards();
                        dealDealerHand();
                    }, this.timeoutVal * 2)
                } else {
                    this.#payMoney();

                    setTimeout(() => {
                        this.#resetTable();
                    }, this.timeoutVal * 5);
                }
            }

            setTimeout(() => {
                dealDealerHand();
            }, this.timeoutVal)
        }
    }

    #payMoney() {
        for (let player of this.players) {
            let playerValue = player.hand[0].getNumericValue();
            let dealerValue = this.dealer.hand.getNumericValue();
            let dealerBlackJack = (dealerValue === 21 && this.dealer.hand.cards.length === 2);
            let playerBlackJack = (playerValue === 21 && player.hand[0].cards.length === 2);

            let resetBet = () => {
                player.bet = 0;
            }

            let loose = () => {
                resetBet();
                player.mainTag.classList.add("player-loose");
            }

            let push = () => {
                player.credit += player.bet;
                resetBet();
                player.mainTag.classList.add("player-push");
            }

            let win = () => {
                player.credit += player.bet * 2;
                resetBet();
                player.mainTag.classList.add("player-win");
            }

            let win_blackJack = () => {
                player.credit += player.bet * 2.5;
                resetBet();
                player.mainTag.classList.add("player-win");
                player.handTag.innerHTML = "<blink class='player-win-black-jack'>BLACKJACK</blink>"
            }

            if (playerBlackJack) {
                if (dealerBlackJack) {
                    push()
                } else {
                    win_blackJack();
                }
            } else if (playerValue > 21) {
                loose();
            } else if (playerValue <= 21) {
                if (player.isPassing) {
                    push()
                } else if (dealerBlackJack) {
                    loose();
                } else if (dealerValue > 21) {
                    win();
                } else if (dealerValue <= 21) {
                    if (playerValue > dealerValue) {
                        win();
                    } else if (playerValue < dealerValue) {
                        loose();
                    } else {
                        push();
                    }
                }
            }

            this.#updateCreditAndBetUI(player);
        }
    }

    #resetTable() {
        this.dealer.hand.cards = [];
        this.dealer.handTag.innerHTML = "";

        for (let player of this.players) {
            try {
                player.mainTag.classList.remove("player-loose");
            } catch (ignored) {}
            try {
                player.mainTag.classList.remove("player-win");
            } catch (ignored) {}
            try {
                player.mainTag.classList.remove("player-push");
            } catch (ignored) {}


            player.handTag.innerHTML = "";
            player.hand[0].cards = [];
            try {
                player.mainTag.classList.remove("player-active");
            } catch (ignored) {}
            try {
                player.mainTag.classList.remove("player-loose");
            } catch (ignored) {}

            // activate bet-buttons again
            this.#toggleButtons(player.buttonsBet);
            // reset variables
            player.isPassing = false;
            player.isReady = false;
            this.playersPassing = 0;
        }

        // shuffle deck if only a given percentile (written as float) of cards is left
        let cardsLeft_percent = 0.25;
        if (this.dealer.currentIndex > this.dealer.deck.length - Math.floor(this.dealer.deck.length * cardsLeft_percent)) {
            let dealer = document.getElementById("dealer-name");
            setTimeout(() => {
                this.dealer.shuffleDeck();
                dealer.style.color = "black";
                dealer.innerHTML = "DEALER";
            }, 2000);

            dealer.style.color = "red";
            dealer.innerHTML = "SHUFFLING";
        }
    }

    #toggleButtons (_buttonArray) {
        for (let button of _buttonArray) {
            button.toggleActive();
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
        this.isPassing = false;
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
        let value = this.getNumericValue();
        return "<mark class='size-value'>" + value + "</mark>";
    }

    getNumericValue() {
        let value = 0
        let aceCounter = 0
        for (let card of this.cards) {
            if (card.value === 1) {
                aceCounter++;
            } else {
                value += card.value;
            }
        }
        while (aceCounter > 0) {
            if (aceCounter > 1) {
                value++;
            } else {
                if (value <= 10) {
                    value += 11;
                } else {
                    value++;
                }
            }
            aceCounter--;
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
        return this.cards[0].html + "<mark id='animate-peek'>" + this.placeholder + "</mark>";
    }

    getPlaceholder(_amount) {
        let str = "";
        for( let i = 0; i < _amount; i++) {
            str += this.placeholder;
        }
        return str;
    }
}

class Button {
    #type;

    constructor(_btnElement, _type) {
        this.element = _btnElement;
        this.isActive = true;
        this.#type = _type;

        this.element.classList.add(`${this.#type}-active`);
    }

    toggleActive() {
        if (this.isActive) {
            this.element.classList.add(`${this.#type}-inactive`);
            this.element.classList.remove(`${this.#type}-active`);
            this.isActive = !this.isActive;
        } else {
            this.element.classList.add(`${this.#type}-active`);
            this.element.classList.remove(`${this.#type}-inactive`);
            this.isActive = !this.isActive;
        }
    }
}

window.onload = () => {
    let dealer = new Dealer(4);
    dealer.shuffleDeck();
    new Table(dealer);
}

