import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Card from './Card';
import './DeckAutoDraw.css';

/** Deck Component --- makes initial API call to Deck of Cards API */
const API_BASE_URL = 'http://deckofcardsapi.com/api/deck';

function DeckAutoDraw() {
	const [deck, setDeck] = useState(null);
	const [drawn, setDrawn] = useState([]);
	const [autoDraw, setAutoDraw] = useState(false);
	const timerRef = useRef(null);

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
					setAutoDraw(false);
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
		if (autoDraw && !timerRef.current) {
			timerRef.current = setInterval(async () => {
				await drawCard();
			}, 1000);
		}

		return () => {
			clearInterval(timerRef.current);
			timerRef.current = null;
		};
	}, [autoDraw, setAutoDraw, deck]);

	const toggleAutoDraw = () => {
		setAutoDraw((auto) => !auto);
	};

	const cards = drawn.map((c) => (
		<Card key={c.id} name={c.name} image={c.image} />
	));

	return (
		<div className="Deck">
			<button className="Deck-autodraw-btn" onClick={toggleAutoDraw}>
				{autoDraw ? 'Stop' : 'Start'} Autodraw
			</button>
			<div className="Deck-display">{cards}</div>
		</div>
	);
}

export default DeckAutoDraw;
