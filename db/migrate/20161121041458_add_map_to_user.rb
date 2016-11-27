class AddMapToUser < ActiveRecord::Migration
  def change
    add_column :users, :map, :int, array: true,
    default: [[1, 1, 1, 1, 1, 1, 1, 1],
                 [1, 1, 1, 1, 1, 1, 1, 1],
                 [1, 1, 1, 1, 1, 1, 1, 1],
                 [1, 1, 1, 3, 1, 1, 1, 1],
                 [1, 1, 3, 2, 3, 1, 1, 1],
                 [1, 1, 3, 2, 3, 3, 3, 3],
                 [1, 1, 3, 2, 2, 2, 2, 2],
                 [1, 1, 2, 2, 3, 3, 3, 3]];
  end
end
