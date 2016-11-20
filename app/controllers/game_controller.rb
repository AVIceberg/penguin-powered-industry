class GameController < ApplicationController

  def gamepage
    if user_is_logged_in?
      @user = User.find_by_id(session[:id])
      gon.strNickname = @user.nickname
      gon.iToys = @user.toys
      gon.iTimeLeft = @user.timeleft
      gon.iSaveInterval = 2; # Save every two minutes
      gon.fClickMultiplier = 1.0;
      gon.iRequiredToys = 5 * @user.level
    else
      redirect_to url_for(:controller => :welcome, :action => :index), :notice => "Please log in or sign up for an account."
    end
  end

  def save
    @user = User.find_by_id(session[:id])
    @user.toys = params[:toys]
    @user.timeleft = params[:time_left]
    @user.save
    render js: ''
  end

  def reset
    @user = User.find_by_id(session[:id])
    if @user.max < params[:maxToys]
      @user.max = params[:maxToys]
    end
    if params[:gainedLevel]
      @user.level = @user.level + 1
    end
  end

end
