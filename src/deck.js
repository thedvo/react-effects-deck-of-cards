import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from './Card';
import './Deck.css';

/** Deck Component --- makes initial API call to Deck of Cards API */
const API_BASE_URL = 'http://deckofcardsapi.com/api/deck';

function Deck() {
	const [deck, setDeck] = useState(null);
	const [drawn, setDrawn] = useState([]);
	const [clicked, setClicked] = useState(false);

	// this is called *after* component first added to DOM
	// Loads a deck from the API
	useEffect(() => {
		async function fetchDeck() {
			let res = await axios.get(`${API_BASE_URL}/new/`);
			setDeck(res.data);
			console.log(res.data);
		}
		fetchDeck();
	}, [setDeck]);

	// Draw a card
	useEffect(() => {
		async function drawCard() {
			// Deck_id from state (deck). Destructure from res.data
			let { deck_id } = deck;

			try {
				// make an axios request to draw a card
				let drawResult = await axios.get(`${API_BASE_URL}/${deck_id}/draw/`);
				console.log(drawResult.data);

				// if there are no remaining cards in the deck, should throw an error
				if (drawResult.data.remaining === 0) {
					throw new Error('No cards remaining!');
				}

				// get the first card from the request data
				const card = drawResult.data.cards[0];

				// run setDraw function to update state. Adds the card to the drawn cards array. (includes: id, name, image)
				setDrawn((d) => [
					...d,
					{
						id: card.code,
						name: card.suit + ' ' + card.value,
						image: card.image,
					},
				]);
			} catch (e) {
				alert(e);
			}
		}
		// call the function if clicked state is set to True (meaning user clicked button to draw card)
		if (clicked) {
			drawCard();
		}

		// clean up function to reset setClicked to False. Allows user to then click again to draw card.
		return () => {
			setClicked(false);
		};
	}, [clicked, deck]);

	// function which runs when user clicks on button to draw card. Will setClicked to True, which then triggers the useEffect to drawCard
	const toggleDraw = () => {
		setClicked((clicked) => !clicked);
	};

	const cards = drawn.map((c) => (
		<Card key={c.id} name={c.name} image={c.image} />
	));

	return (
		<div className="deck">
			<button className="deck-draw-btn" onClick={toggleDraw}>
				Gimme a Card!
			</button>
			<div className="deck-card-display">{cards}</div>
		</div>
	);
}

export default Deck;
