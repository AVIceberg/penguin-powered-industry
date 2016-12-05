class AddToysToUsers < ActiveRecord::Migration
  def change
    add_column :users, :toys, :bigint
  end
end
