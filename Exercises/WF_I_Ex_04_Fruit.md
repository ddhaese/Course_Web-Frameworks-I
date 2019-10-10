# WebFrameworks Part I (26543/1700/1920/1/00)

## Exercises on CouchDB

### Ex_04: Fruit

#### Given

- Installed CouchDB
- Installed Postman

#### Assignment

First, using Fauxton only:

- Create a database called *fruit*
- Add documents with id's *apple*, *orange*, *pear*, *strawberry*, *tomato* and *banana* (so not the default generated IDs) with, for each, the attributes *color*, *tastes* and *shape*

  ```json
  {
  	"color":"yellow",
  	"tastes": ["sweet"],
  	"shape":"bent"
  }
  ```

- Create a view to list all fruit with their color
- Create a aggregate view that counts the number of documents for each shape
- Create a aggregate view that counts the presence of each taste
- Replicate *fruit* to *old_fruit*
- Remove *fruit*
- Remove *old_fruit*

Next, do the same using Postman
