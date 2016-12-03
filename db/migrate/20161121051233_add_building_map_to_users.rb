class AddBuildingMapToUsers < ActiveRecord::Migration
  def change
    add_column :users, :building_map, :string, array: true,
    default: [[["-1", 0], ["-1", 0], ["-1", 0], ["-1", 0], ["-1", 0], ["-1", 0], ["-1", 0], ["-1", 0]],
              [["-1", 0], ["-1", 0], ["-1", 0], ["-1", 0], ["-1", 0], ["-1", 0], ["-1", 0], ["-1", 0]],
              [["-1", 0], ["-1", 0], ["-1", 0], ["-1", 0], ["-1", 0], ["-1", 0], ["-1", 0], ["-1", 0]],
              [["-1", 0], ["-1", 0], ["-1", 0], ["-1", 0], ["-1", 0], ["-1", 0], ["-1", 0], ["-1", 0]],
              [["-1", 0], ["-1", 0], ["-1", 0], ["-1", 0], ["-1", 0], ["-1", 0], ["-1", 0], ["-1", 0]],
              [["-1", 0], ["-1", 0], ["-1", 0], ["-1", 0], ["-1", 0], ["-1", 0], ["-1", 0], ["-1", 0]],
              [["-1", 0], ["-1", 0], ["-1", 0], ["-1", 0], ["-1", 0], ["-1", 0], ["-1", 0], ["-1", 0]],
              [["-1", 0], ["-1", 0], ["-1", 0], ["-1", 0], ["-1", 0], ["-1", 0], ["-1", 0], ["-1", 0]]];
  end
end
