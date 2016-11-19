class AddTimeLeftToUsers < ActiveRecord::Migration
  def change
    add_column :users, :timeleft, :int
  end
end
