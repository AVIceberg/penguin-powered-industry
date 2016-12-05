class AddupgradeState < ActiveRecord::Migration
  def change
    add_column :users, :upgradestate, :integer,
    default: 0
  end
end
