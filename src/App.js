import React, { useState, useEffect } from "react";
import { AptosClient } from "aptos";
import "./App.css"; // Import the custom CSS

const client = new AptosClient("https://fullnode.devnet.aptoslabs.com/v1");

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [vote, setVote] = useState(null);
  const [results, setResults] = useState(null);

  const connectWallet = async () => {
    try {
      const wallet = await window.aptos.connect();
      const address = await window.aptos.account();
      setWalletAddress(address.address);
    } catch (err) {
      console.error("Error connecting wallet:", err);
    }
  };

  useEffect(() => {
    setElections([
      { id: 1, name: "Vice President", candidates: ["Alice", "Bob", "Charlie"] },
      { id: 2, name: "President", candidates: ["David", "Eva", "Frank"] },
      { id: 1, name: "Secretary", candidates: ["Alice", "Bob", "Charlie"] },
      { id: 2, name: "Treasurer", candidates: ["David", "Eva", "Frank"] },
    ]);
  }, []);

  const castVote = async () => {
    if (!selectedElection || !vote) return;

    try {
      const txn = {
        type: "entry_function_payload",
        function: "0xYourContractAddress::Voting::vote", // Update with your contract function
        arguments: [selectedElection.id, vote],
      };
      await window.aptos.signAndSubmitTransaction(txn);
      alert("Vote submitted!");
    } catch (err) {
      console.error("Error submitting vote:", err);
    }
  };

  const fetchResults = async () => {
    try {
      const electionResults = await client.getTableItem({
        tableHandle: "0xElectionTable", // Replace with actual table handle from your smart contract
        key: selectedElection.id,
        keyType: "u64",
        valueType: "vector<u64>",
      });
      setResults(electionResults);
    } catch (err) {
      console.error("Error fetching results:", err);
    }
  };

  return (
    <div className="App">
      <h1>IGDTUW Societies Core Members Recruitment Voting System</h1>

      {!walletAddress ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected Wallet: {walletAddress}</p>
        </div>
      )}

      <h2>Available Positions</h2>
      <select
        onChange={(e) => setSelectedElection(elections[e.target.value])}
        className="election-select"
      >
        <option value="">Select a Position</option>
        {elections.map((election, index) => (
          <option key={election.id} value={index}>
            {election.name}
          </option>
        ))}
      </select>

      {selectedElection && (
        <div>
          <h3>{selectedElection.name}</h3>
          <p>Select a candidate to vote for:</p>
          <select
            className="candidate-select"
            onChange={(e) => setVote(e.target.value)}
          >
            <option value="">Select a candidate</option>
            {selectedElection.candidates.map((candidate, index) => (
              <option key={index} value={index}>
                {candidate}
              </option>
            ))}
          </select>
          <button className="vote-btn" onClick={castVote}>Submit Vote</button>

          <h3>Results</h3>
          <button onClick={fetchResults}>View Results</button>

          {results && (
            <div className="results">
              {results.map((result, index) => (
                <p key={index}>
                  {selectedElection.candidates[index]}: {result} votes
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
