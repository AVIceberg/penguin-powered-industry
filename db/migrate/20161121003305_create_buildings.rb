class CreateBuildings < ActiveRecord::Migration
  def change
    create_table :buildings do |t|
      t.integer :capacity
      t.integer :max_generation

      t.timestamps null: false
    end
  end
end
