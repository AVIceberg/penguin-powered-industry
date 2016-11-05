# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20161104220542) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "Measurements", force: :cascade do |t|
    t.string   "measurement_type"
    t.datetime "created_at",       null: false
    t.datetime "updated_at",       null: false
  end

  create_table "ar_internal_metadata", primary_key: "key", force: :cascade do |t|
    t.string   "value"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "ingredients", force: :cascade do |t|
    t.integer  "ingredient_id"
    t.integer  "recipe_id"
    t.string   "ingredient_name"
    t.string   "web_link"
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
  end

  create_table "measurements", force: :cascade do |t|
    t.string   "type"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "people", force: :cascade do |t|
    t.string   "pname"
    t.integer  "age"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "recipe_ratings", force: :cascade do |t|
    t.integer  "recipe_id"
    t.integer  "user_id"
    t.string   "comment"
    t.integer  "rating"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "recipes", force: :cascade do |t|
    t.integer  "recipe_id"
    t.integer  "user_id"
    t.string   "recipe_name"
    t.string   "instructions"
    t.integer  "complexity"
    t.datetime "created_at",   null: false
    t.datetime "updated_at",   null: false
  end

  create_table "tags", force: :cascade do |t|
    t.integer  "tag_id"
    t.string   "tag_name"
    t.boolean  "approved"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "tags_recipes", force: :cascade do |t|
    t.integer  "tag_id"
    t.integer  "recipe_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "things", force: :cascade do |t|
    t.string   "tname"
    t.text     "description"
    t.integer  "person_id"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
  end

  create_table "tokimons", force: :cascade do |t|
    t.string   "toname"
    t.integer  "weight"
    t.integer  "height"
    t.integer  "fly"
    t.integer  "fight"
    t.integer  "fire"
    t.integer  "water"
    t.integer  "electric"
    t.integer  "ice"
    t.integer  "total"
    t.integer  "trainer_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "users", force: :cascade do |t|
    t.string   "fname"
    t.string   "lname"
    t.string   "nickname"
    t.string   "email"
    t.datetime "created_at",                null: false
    t.datetime "updated_at",                null: false
    t.string   "password_digest"
    t.integer  "level"
    t.integer  "max",             limit: 8
    t.boolean  "admin"
    t.integer  "toys",            limit: 8
  end

  add_index "users", ["email"], name: "index_users_on_email", unique: true, using: :btree

  create_table "widgets", force: :cascade do |t|
    t.string   "name"
    t.text     "description"
    t.integer  "stock"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

end
