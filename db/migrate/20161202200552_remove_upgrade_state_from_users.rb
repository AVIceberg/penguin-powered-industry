class RemoveUpgradeStateFromUsers < ActiveRecord::Migration
  def change
    remove_column :users, :upgradestate, :integer
  end
end
