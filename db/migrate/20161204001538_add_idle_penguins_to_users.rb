class AddIdlePenguinsToUsers < ActiveRecord::Migration
  def change
    add_column :users, :idlepenguins, :integer,
    default: 0
  end
end
