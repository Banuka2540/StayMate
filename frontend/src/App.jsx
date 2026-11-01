import { useState } from "react";

function App() {

    const [message, setMessage] = useState("");

    const getMessage = async () => {

        try {

            const response = await fetch(
                "http://localhost:5000/api/hello"
            );

            const data = await response.json();

            setMessage(data.message);

        } catch (error) {

            console.log(error);

        }

    };

    return (
        <div>

            <h1>React Frontend</h1>

            <button onClick={getMessage}>
                Get Backend Message
            </button>

            <h2>{message}</h2>

        </div>
    );
}

export default App;