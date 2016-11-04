class AddMaxToUsers < ActiveRecord::Migration
  def change
    add_column :users, :max, :bigint
  end
end
