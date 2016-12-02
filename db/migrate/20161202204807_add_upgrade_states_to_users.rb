class AddUpgradeStatesToUsers < ActiveRecord::Migration
  def change
    add_column :users, :upgrade_states, :int, array: true,
    default: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  end
end
