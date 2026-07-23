import "./Counter.css";

type CounterProps = {
	games: number;
	victories: number;
	winrate: number;
	friends: number;
};

function Counter({games, victories, winrate, friends}: CounterProps) {
	return (
		<div className="Counter">
			
		</div>
	);
}

export default Counter;
