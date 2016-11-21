class AddMapToUser < ActiveRecord::Migration
  def change
    add_column :users, :map, :string, array: true,
    default: [["P", "P", "P", "P", "P", "P", "P", "P"],
              ["P", "P", "P", "P", "P", "P", "P", "P"],
              ["P", "P", "P", "P", "P", "P", "P", "P"],
              ["P", "P", "P", "P", "P", "P", "P", "P"],
              ["P", "P", "P", "W", "P", "P", "P", "P"],
              ["P", "P", "P", "W", "P", "P", "P", "P"],
              ["P", "P", "P", "W", "W", "W", "W", "W"],
              ["P", "P", "W", "W", "P", "P", "P", "P"]];
  end
end
