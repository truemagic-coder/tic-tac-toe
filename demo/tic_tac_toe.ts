/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/tic_tac_toe.json`.
 */
export type TicTacToe = {
  "address": "B9psyocSf7CZ65tLZABc9rEP2DHAB1ZfUkDKjbbT9KVa",
  "metadata": {
    "name": "ticTacToe",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "game",
          "writable": true,
          "signer": true
        },
        {
          "name": "player",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "makeMove",
      "discriminator": [
        78,
        77,
        152,
        203,
        222,
        211,
        208,
        233
      ],
      "accounts": [
        {
          "name": "game",
          "writable": true
        },
        {
          "name": "player",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "row",
          "type": "u8"
        },
        {
          "name": "col",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "game",
      "discriminator": [
        27,
        90,
        166,
        125,
        74,
        100,
        121,
        18
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "gameEnded",
      "msg": "The game has already ended"
    },
    {
      "code": 6001,
      "name": "invalidMove",
      "msg": "The move is invalid"
    },
    {
      "code": 6002,
      "name": "spaceTaken",
      "msg": "The space is already taken"
    }
  ],
  "types": [
    {
      "name": "game",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "board",
            "type": {
              "array": [
                {
                  "array": [
                    {
                      "option": "bool"
                    },
                    3
                  ]
                },
                3
              ]
            }
          },
          {
            "name": "currentPlayer",
            "type": "bool"
          },
          {
            "name": "isActive",
            "type": "bool"
          }
        ]
      }
    }
  ]
};
