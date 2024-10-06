# Todo-app

The end result for Hive Helsinki masterclass in javascript backend with node/express.

# Usage and endpoints

- Copy the repository with git to wherever you'd like
- `cd` to directory and run `npm install`
- run the server with `npm start`, you got a server now running in the localhost port 3000
- alternatively to test out the error messages from the backend run `npm run start:errors`

## Endpoints

| HTTP Method | Endpoint       | Description             | Notes                                                                                            |
| ----------- | -------------- | ----------------------- | ------------------------------------------------------------------------------------------------ |
| GET         | `/todos`       | Get all todos           | Returns an array of objects                                                                      |
| GET         | `/todos/count` | Get the number of todos | Returns a number, used only for example purposes unless you find anything useful for this        |
| GET         | `/todos/:id`   | Get a single todo by ID | Returns single object                                                                            |
| POST        | `/todos`       | Create a new todo       | Parses data from req.body.text so send data as `{ "text": "Todo text here" }`                    |
| PUT         | `/todos/:id`   | Update a todo by ID     | Can be used to update either the text or completed, uses spread to copy all previous information |
| DELETE      | `/todos/:id`   | Delete a todo by ID     |                                                                                                  |

The structure for the javascript object is

```
{
  "id": number,
  "text": string,
  "completed": boolean
}
```
