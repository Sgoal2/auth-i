
exports.up = function(knex, Promise) {
    return knex.schema.createTable('users', function(users) {
        //primary key
        users.increments();
//other fields
        users.string('username').unique().notNullable();//.unique();//check if this unique makes sense
        users.string('password').notNullable();
    
});
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('users')
};
