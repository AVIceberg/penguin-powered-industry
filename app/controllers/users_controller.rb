class UsersController < ApplicationController
  def new
    @user = User.new
  end

  def index
    @users = Users.all
  end

  def create

  end


  def edit

  end

  def show
    @user = User.find(params[:id])
  end

  def update

  end

  def destroy

  end

end
