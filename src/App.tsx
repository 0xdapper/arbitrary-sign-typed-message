import { useAccount, useConnect, useDisconnect, useSignTypedData } from "wagmi";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";

function App() {
  const account = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const {
    signTypedData,
    data: signature,
    error: signError,
  } = useSignTypedData();
  const [searchParams, setSearchParams] = useSearchParams();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [jsonInput, setJsonInput] = useState(() => {
    const jsonParam = searchParams.get("json");
    if (jsonParam) {
      try {
        return JSON.stringify(JSON.parse(atob(jsonParam)), null, 2);
      } catch (e) {
        return "";
      }
    }
    return "";
  });

  useEffect(() => {
    if (jsonInput) {
      try {
        JSON.parse(jsonInput); // Validate JSON
        setSearchParams({ json: btoa(jsonInput) });
      } catch (e) {
        // Don't update URL if JSON is invalid
      }
    } else {
      setSearchParams({});
    }
  }, [jsonInput, setSearchParams]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [jsonInput]);

  const handleSign = async () => {
    try {
      // Parse the JSON input
      const typedData = JSON.parse(jsonInput);

      // Trigger the signing
      signTypedData(typedData);
    } catch (err) {
      console.error("JSON parsing error:", err);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "20px",
        gap: "20px",
      }}
    >
      <div style={{ display: "flex", gap: "20px" }}>
        <div style={{ flex: "1" }}>
          <div>
            <h2>Account</h2>
            <div>
              status: {account.status}
              <br />
              addresses: {JSON.stringify(account.addresses)}
              <br />
              chainId: {account.chainId}
            </div>

            {account.status === "connected" && (
              <button type="button" onClick={() => disconnect()}>
                Disconnect
              </button>
            )}
          </div>

          <div style={{ marginTop: "20px" }}>
            <h2>Connect</h2>
            {connectors.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => connect({ connector })}
                type="button"
              >
                {connector.name}
              </button>
            ))}
            <div>{status}</div>
            <div>{error?.message}</div>
          </div>
        </div>

        <div style={{ flex: "1" }}>
          <div
            style={{
              padding: "20px",
              backgroundColor: "#fff3cd",
              color: "#856404",
              border: "1px solid #ffeeba",
              borderRadius: "4px",
              fontSize: "1.1em",
            }}
          >
            <h3 style={{ color: "#856404", marginTop: 0 }}>⚠️ WARNING ⚠️</h3>
            <p>
              <strong>
                ALWAYS carefully review the typed data before signing:
              </strong>
            </p>
            <ul>
              <li>Check all field types in the "types" section</li>
              <li>Verify the message content thoroughly</li>
              <li>Make sure you understand what you're signing</li>
              <li>Never sign data from untrusted sources</li>
            </ul>
            <p>
              Signing malicious typed data could compromise your wallet
              security!
            </p>
          </div>
        </div>
      </div>

      <div style={{ width: "100%" }}>
        <h2>Sign Typed Data</h2>
        <textarea
          ref={textareaRef}
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder={`Paste your typed data JSON here, for example:
{
  "types": {
    "Person": [
      { "name": "name", "type": "string" },
      { "name": "wallet", "type": "address" }
    ],
    "Mail": [
      { "name": "from", "type": "Person" },
      { "name": "to", "type": "Person" },
      { "name": "contents", "type": "string" }
    ]
  },
  "primaryType": "Mail",
  "message": {
    "from": {
      "name": "Cow",
      "wallet": "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826"
    },
    "to": {
      "name": "Bob",
      "wallet": "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB"
    },
    "contents": "Hello, Bob!"
  }
}`}
          style={{
            width: "100%",
            minHeight: "200px",
            marginBottom: "10px",
            resize: "none",
            overflow: "hidden",
          }}
        />
        {signError && (
          <div style={{ color: "red" }}>
            {signError.message || "An error occurred while signing"}
          </div>
        )}
        <button
          type="button"
          onClick={handleSign}
          disabled={account.status !== "connected"}
        >
          Sign Typed Data
        </button>

        {signature && (
          <div style={{ marginTop: "20px" }}>
            <h3>Signature:</h3>
            <code
              style={{
                display: "block",
                padding: "10px",
                background: "#f5f5f5",
                color: "#000000",
                borderRadius: "4px",
                wordWrap: "break-word",
              }}
            >
              {signature}
            </code>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
