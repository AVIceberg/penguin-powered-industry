class UsersController < ApplicationController
  def new
    @user = User.new
  end

  def index
    @users = User.all
  end

  def create
    @user = User.new(user_params)

    if @user.save
      session[:id] = @user.id
      redirect_to @user, :notice => "Success!"
    else
      render "new"
    end
  end

  def edit
    @user = User.find(params[:id])
    if user_is_logged_in?
      if @user.id != session[:id]
        redirect_to User.find(session[:id]), :notice => "You cannot edit other people's accounts!"
      end
    else
      redirect_to welcome, :notice => "Please sign in before editing your account."
    end
  end

  def show
    @user = User.find(params[:id])
  end

  def update
    @user = User.find(params[:id])
    if @user.update(params[:user].permit(:fname, :lname, :email))
      redirect_to @user, notice: 'Account was successfully updated'
    else
      render :edit
    end
  end

  def destroy

  end

    private
      def user_params
        params.require(:user).permit(:fname, :lname, :nickname, :email, :password, :password_confirmation)
      end
end
