require('dotenv').config()
const { expect } = require('chai')
const supertest = require('supertest')
const knex = require('knex');
const ShoppingListService = require('../src/shopping-list-service');

describe('shopping-List service object', () => {
    let db;
  
    // We'll use this array as an example of mock data that represents
    // valid content for our database 
    const testItems = [
      {
        product_id: 1,
        name: 'product 1',
        price: '1.25',
        date_added: new Date('2029-01-22T16:28:32.615Z'),
        checked: true,
        category: 'Snack'
      },
      {
        product_id: 2,
        name: 'product 2',
        price: '2.25',
        date_added: new Date('2029-01-22T16:28:32.615Z'),
        checked: true,
        category: 'Snack'
      },
      {
        product_id: 3,
        name: 'product 3',
        price: '3.25',
        date_added: new Date('2029-01-22T16:28:32.615Z'),
        checked: true,
        category: 'Snack'
      },
    ];
  
    // Prepare the database connection using the `db` variable available
    // in the scope of the primary `describe` block. This means `db`
    // will be available in all of our tests.
    before('setup db', () => {
      db = knex({
        client: 'pg',
        connection: process.env.TEST_DB_URL,
      });
    });
  
    // Before all tests run and after each individual test, empty the
    // shopping_list table
    before('clean db', () => db('shopping_list').truncate());
    afterEach('clean db', () => db('shopping_list').truncate());
  
    // After all tests run, let go of the db connection
    after('destroy db connection', () => db.destroy());
  
    describe('getAllitems()', () => {
      it('returns an empty array', () => {
        return ShoppingListService
          .getAllItems(db)
          .then(items => expect(items).to.eql([]));
      });
  
      // Whenever we set a context with data present, we should always include
      // a beforeEach() hook within the context that takes care of adding the
      // appropriate data to our table
      context('with data present', () => {
        beforeEach('insert test items', () =>
          db('shopping_list')
            .insert(testItems)
        );
  
        it('returns all test items', () => {
          return ShoppingListService
            .getAllItems(db)
            .then(items => expect(items).to.eql(testItems));
        });
      });
    });
  
    describe('insertItem()' , () => {
      it('inserts record in db and returns Item with new id', () => {
        // New item to use as subject of our test
        const newItem = {
            name: 'product 4',
            price: '30.25',
            date_added: new Date('2029-01-22T16:28:32.615Z'),
            checked: true,
            category: "Snack"
        };
  
        return ShoppingListService.insertItem(db, newItem)
          .then(actual => {
            expect(actual).to.eql({
              product_id: 1,
              name: newItem.name,
              price: newItem.price,
              date_added: newItem.date_added,
              checked: newItem.checked,
              category: newItem.category
            });
          });
      });
  
      it('throws not-null constraint error if title not provided', () => {
        // Subject for the test does not contain a `title` field, so we
        // expect the database to prevent the record to be added      
        const newItem = {
            name: 'product 10',
            date_added: new Date('2029-01-22T16:28:32.615Z'),
            checked: true,
            category: 'Snack',
        };
  
        // The .then() method on a promise can optionally take a second argument:
        // The first callback occurs if the promise is resolved, which we've been
        // using for all our promise chains. The second occurs if promise is 
        // rejected. In the following test, we EXPECT the promise to be rejected 
        // as the database should throw an error due to the NOT NULL constraint 
        return ShoppingListService 
          .insertItem(db, newItem)
          .then(
            () => expect.fail('db should throw error'),
            err => expect(err.message).to.include('not-null')
          );
      });
    });
  
    describe('getById()', () => {
      it('should return undefined', () => {
        return ShoppingListService
          .getById(db, 999)
          .then(item => expect(item).to.be.undefined);
      });
  
      context('with data present', () => {
        before('insert items', () => 
          db('shopping_list')
            .insert(testItems)
        );
  
        it('should return existing item', () => {
          const expectedItemId = 3;
          const expectedItem = testItems.find(a => a.product_id === expectedItemId);
          return ShoppingListService.getById(db, expectedItemId)
            .then(actual => expect(actual).to.eql(expectedItem));
        });
      });
    });
  
    describe('deleteItem()', () => {
      it('should return 0 rows affected', () => {
        return ShoppingListService
          .deleteItem(db, 999)
          .then(rowsAffected => expect(rowsAffected).to.eq(0));
      });
  
      context('with data present', () => {
        before('insert items', () => 
          db('shopping_list')
            .insert(testItems)
        );
  
        it('should return 1 row affected and record is removed from db', () => {
          const deletedItemId = 1;
  
          return ShoppingListService
            .deleteItem(db, deletedItemId)
            .then(rowsAffected => {
              expect(rowsAffected).to.eq(1);
              return db('shopping_list').select('*');
            })
            .then(actual => {
              // copy testItems array with id 1 filtered out
              const expected = testItems.filter(a => a.product_id !== deletedItemId);
              expect(actual).to.eql(expected);
            });
        });
      });
    });
  
    describe('updateArticle()', () => {
      it('should return 0 rows affected', () => {
        return ShoppingListService
          .updateItem(db, 999, { name: 'new name!' })
          .then(rowsAffected => expect(rowsAffected).to.eq(0));
      });
  
      context('with data present', () => {
        before('insert items', () => 
          db('shopping_list')
            .insert(testItems)
        );
  
        it('should successfully update an Item', () => {
          const updatedItemId = 1;
          const testItem = testItems.find(a => a.product_id === updatedItemId);
          // make copy of testArticle in db, overwriting with newly updated field value
          const updatedItem = { ...testItem, name: 'new name!' };
  
          return ShoppingListService
            .updateItem(db, updatedItemId, updatedItem)
            .then(rowsAffected => {
              expect(rowsAffected).to.eq(1)
              return db('shopping_list').select('*').where({ product_id: updatedItemId }).first();
            })
            .then(item => {
              expect(item).to.eql(updatedItem);
            });
        });
      });
    });
  });