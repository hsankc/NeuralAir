export const NeuralAirIDL = {
  "version": "0.1.0",
  "name": "neuralair",
  "instructions": [
    {
      "name": "recordFlight",
      "accounts": [
        {
          "name": "flightRecord",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "operator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "droneId",
          "type": "string"
        },
        {
          "name": "gpsData",
          "type": "string"
        },
        {
          "name": "flightTime",
          "type": "i64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "flightRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "operator",
            "type": "publicKey"
          },
          {
            "name": "droneId",
            "type": "string"
          },
          {
            "name": "gpsData",
            "type": "string"
          },
          {
            "name": "flightTime",
            "type": "i64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
