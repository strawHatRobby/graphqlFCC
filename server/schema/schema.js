const graphql = require('graphql');
const _ = require('lodash'); // used for utility functions in js arrays and objects
const { GraphQLObjectType,
  GraphQLString,
   GraphQLSchema,
   GraphQLID,
   GraphQLInt,
    GraphQLList,
    GraphQLNonNull
   } = graphql; // ES^ destructuring

const Book = require('../models/book')
const Author = require('../models/author')

var books  = [
    {name:'Harry Potter and the Prisoner of Azkaban', genre:'Fiction', id:'1', authorId:'1'},
    {name:'God Father', genre:'Drama', id:'2', authorId:'2'},
    {name:'NottingHill with Love', genre:'Romantic', id:'3', authorId:'3'},
    {name:'The Shining', genre:'Horror', id:'4', authorId:'5'},
    {name:'Noddy', genre:'Childrens', id:'5', authorId:'4'},
    {name:'How to Win Over People', genre:'Self Help', id:'6', authorId:'6'},
    {name:'IT', genre:'Horror Adventure', id:'7', authorId:'5'}
];

const BookType = new GraphQLObjectType({
    name: 'Book',
    fields: () => ({ // its of function type as we are not executing code unless needed
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        genre: { type: GraphQLString },
        author: {
          type: AuthorType,
          resolve(parent, args){
            // return _.find(authors, { id: parent.authorId })
            return Author.findById(parent.authorId);
          }
        }
    })
})

var authors = [
    {name: 'J.K Rowling',  age: 55, id:'1'},
    {name: 'Mario Puzo',  age: 78, id:'2'},
    {name: 'Palo Colhio',  age: 60, id:'3'},
    {name: 'Enid Blyton',  age: 71, id:'4'},
    {name: 'Stephen King',  age: 95, id:'5'},
    {name: 'Robert C Dini',  age: 82, id:'6'},
]

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        age: { type: GraphQLInt },
        books: {
          type: new GraphQLList(BookType),
          resolve(parent, args){
            // find every book in book array with the current author id //
            // return _.filter(books, {authorId: parent.id})
            // check for all books find books wiht authorId as parentID
            return Book.find({authorId: parent.id});
          }
        }
    })
})


const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        book: {
            type: BookType,
            args: { id: {type: GraphQLID} }, //the query takes an id of tpye stirng
            resolve(parent, args){
                // code to get data from db or any other source will come here
                // return _.find(books, { id: args.id })
                  return Book.findById(args.id);
            }
        },
        author: {
            type: AuthorType,
            args: { id: {type: GraphQLID} }, //the query takes an id of tpye stirng
            resolve(parent, args){
                // code to get data from db or any other source will come here
                // return _.find(authors, { id: args.id })
                return Author.findById(args.id);
            }
        },
        books: {
          type: new GraphQLList(BookType),
          resolve(parents, args){
            // return books
          return Book.find({})
          }
        },
        authors: {
          type: new GraphQLList(AuthorType),
          resolve(parents, args){
            // return authors
            return Author.find({})

          }
        }
    }
})

// how to modify the data in all ases of CRUD
const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addAuthor: {
      type: AuthorType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) }
      },
      resolve(parent, args){
        let author = new Author({
          name: args.name,
          age: args.age
        });
        //saving the author instance to Database
        return author.save()
      }
    },
    addBook: {
      type: BookType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        genre: { type: new GraphQLNonNull(GraphQLString) },
        authorId: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve(parent, args){
        let book = new Book({
          name: args.name,
          genre: args.genre,
          authorId: args.authorId
        });
        return book.save()
      }
    }
  }
})

module.exports = new GraphQLSchema({
    // intial root query
    query: RootQuery,
    mutation: Mutation // modify the database as well while oing the query if needed
})
