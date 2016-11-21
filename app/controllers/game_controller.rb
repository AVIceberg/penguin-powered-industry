class GameController < ApplicationController

  def gamepage
    if user_is_logged_in?
      @user = User.find_by_id(session[:id])
      gon.strNickname = @user.nickname
      gon.iToys = @user.toys
      gon.iTimeLeft = @user.timeleft
      gon.iSaveInterval = 2 # Save every two minutes
      gon.fClickMultiplier = 1.0
      gon.iRequiredToys = 5 * @user.level
      gon.iMapSize = 800
      gon.iPassiveIncome = 0

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
    @user.toys = 0
    @user.save
    redirect_to url_for(:controller => :welcome, :action => :index)
  end
end
