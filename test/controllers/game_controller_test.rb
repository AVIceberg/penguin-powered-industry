require 'test_helper'
require 'json'

class GameControllerTest < ActionController::TestCase
  # test "the truth" do
  #   assert true
  # end

  # Non-functional due to the integration of the clicking area into the canvas
  # test "Clicking Area Generated" do
  #   session[:id] = users(:Alex).id
  #   get :gamepage
  #   assert_select '#clicking-area'
  # end

  test "Save button exists" do
    session[:id] = users(:Alex).id
    get :gamepage
    assert_select '#save-button'
  end

  test "Clock-specific HTML exists" do
    session[:id] = users(:Alex).id
    get :gamepage
    assert_select 'div.timer'
    assert_select 'span#minutes'
    assert_select 'span#seconds'
  end

  test "Admin user can see debug buttons" do
    session[:id] = users(:Kate).id
    get :gamepage
    assert_select '#admin-add'
    assert_select '#admin-time'
  end

  test "Regular users cannot see debug buttons" do
    session[:id] = users(:Alex).id
    get :gamepage
    assert_select '#admin-add', false
    assert_select '#admin-time', false
  end

  test "New building save contains no buildings" do
    session[:id] = users(:Alex).id
    building = users(:Alex).building_map
    assert_response :success
    count = 0
    (0..15).each do |i|
      (0..15).each do |j|
        if building[i][j][0] != "-1"
          count = count + 1
        end
      end
    end
    assert_equal count, 0
  end

  test "New map save contains no error tiles" do
    session[:id] = users(:Alex).id
    map = users(:Alex).map
    assert_response :success
    count = 0
    (0..15).each do |i|
      (0..15).each do |j|
        if map[i][j] == 0
          count = count + 1
        end
      end
    end
    assert_equal count, 0
  end

  test "Shop HTML button no longer exists" do
    session[:id] = users(:Alex).id
    assert_select "#buy-labour-camp", false
    assert_select "#buy-toy-mine", false
    assert_select "#buy-factory", false
  end

end
