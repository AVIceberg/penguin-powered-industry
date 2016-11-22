class AddUserIdToBuildings < ActiveRecord::Migration
  def change
    add_column :buildings, :user_id, :integer
  end
end
