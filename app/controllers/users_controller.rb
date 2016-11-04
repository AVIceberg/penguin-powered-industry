class UsersController < ApplicationController
  def new
    @user = User.new
  end

  def index
    @users = Users.all
  end

  def create
    @user = User.new(user_params)

    if @user.save
      redirect_to @user, :notice => "Success!"
    else
      render "new"
    end
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

    private
      def user_params
        params.require(:user).permit(:fname, :lname, :nickname, :email, :password, :password_confirmation)
      end
end
