class GameController < ApplicationController

  def gamepage
    if user_is_logged_in?
      @user = User.find_by_id(session[:id])
      gon.strNickname = @user.nickname
      gon.iToys = @user.toys
      gon.iTimeLeft = @user.timeleft

      gon.iPassiveIncome = 0 # Passive income; initialized in-game -- TO BE REMOVED ONCE PENGUINS IMPLEMENTED

      gon.iRequiredToys = 50000 * @user.level # The number of toys required for the user to beat the level

      gon.iMapSize = 800 # Width / height of the map
      gon.iMapOffsetX = 200 # Offset left on the canvas for other areas to be added to the left of the map
      gon.iBaseTileLength = 100
      gon.iUpgradeStates = [0, 0, 0];

      gon.iadmin = @user.admin

      @map = Array.new(8){Array.new(8)}
      8.times do |i|
        8.times do |j|
          @map[i][j] = @user.map[i][j]
        end
      end

      @buildingMap = Array.new(8){Array.new(8)}
      8.times do |i|
        8.times do |j|
          @buildingMap[i][j] = @user.building_map[i][j]
        end
      end

      @upgrades = Array.new(16)
      16.times do |i|
        @upgrades[i] = @user.upgrade_states[i]
      end

      gon.iUpgradeStates = @upgrades;
      gon.strMapSave = @map
      gon.strBuildingMapSave = @buildingMap

    else
      redirect_to url_for(:controller => :welcome, :action => :index), :notice => "Please log in or sign up for an account."
    end
  end

  def save
    @user = User.find_by_id(session[:id])
    if @user
      @user.toys = params[:toys]
      @user.timeleft = params[:time_left]
      @user.map = JSON.parse(params[:map])
      @user.building_map = JSON.parse(params[:building_map])
      @user.upgrade_states = JSON.parse(params[:upgrade_states])
      @user.save
    end
    render js: ''
  end

  def reset
    @user = User.find_by_id(session[:id])
    if params[:maxToys].to_i > @user.max.to_i
      @user.max = params[:maxToys]
    end
    if params[:leveledUp].downcase == "true" # Determines whether they should level up
      @user.level = @user.level + 1
    end
    @user.timeleft = 45 * 60
    @user.upgradestate = 0
    @user.toys = 0
    @user.building_map = [["-1", "-1", "-1", "-1", "-1", "-1", "-1", "-1"],
                          ["-1", "-1", "-1", "-1", "-1", "-1", "-1", "-1"],
                          ["-1", "-1", "-1", "-1", "-1", "-1", "-1", "-1"],
                          ["-1", "-1", "-1", "-1", "-1", "-1", "-1", "-1"],
                          ["-1", "-1", "-1", "-1", "-1", "-1", "-1", "-1"],
                          ["-1", "-1", "-1", "-1", "-1", "-1", "-1", "-1"],
                          ["-1", "-1", "-1", "-1", "-1", "-1", "-1", "-1"],
                          ["-1", "-1", "-1", "-1", "-1", "-1", "-1", "-1"]];
    @user.map = [[1, 1, 1, 1, 1, 1, 1, 1],
                 [1, 1, 1, 1, 1, 1, 1, 1],
                 [1, 1, 1, 1, 1, 1, 1, 1],
                 [1, 1, 1, 3, 1, 1, 1, 1],
                 [1, 1, 3, 2, 3, 1, 1, 1],
                 [1, 1, 3, 2, 3, 3, 3, 3],
                 [1, 1, 3, 2, 2, 2, 2, 2],
                 [1, 1, 2, 2, 3, 3, 3, 3]];
    @user.save
    redirect_to url_for(:controller => :welcome, :action => :index)
  end
end
