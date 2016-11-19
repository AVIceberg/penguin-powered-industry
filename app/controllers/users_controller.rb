class UsersController < ApplicationController
  def new
    @user = User.new
  end

  def index
    @users = User.all
  end

  def create
    @user = User.new(user_params)
    @user.level = 1
    @user.max = 0
    @user.toys = 0
    @user.admin = false
    @user.timeleft = 45 * 60
    if @user.save
      session[:id] = @user.id
      redirect_to @user, :notice => "Success!"
    else
      render "new"
    end
  end

  def edit
    @user = User.find_by_id(params[:id])
    if @user
      if user_is_logged_in?
        if @user.id != session[:id]
          if !user_is_admin?
            redirect_to User.find(session[:id]), :notice => "You cannot edit other people's accounts!"
          end
        end
      else
        redirect_to url_for(:controller => :welcome, :action => :index), :notice => "Please log in before editing your account."
      end
    else
      redirect_to url_for(:controller => :welcome, :action => :index), :notice => "Invalid user!"
    end
  end

  def show
    @user = User.find_by_id(params[:id])
    if !@user
      redirect_to url_for(:controller => :welcome, :action => :index), :notice => "Invalid user!"
    end
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
    @user = User.find(params[:id])
    if @user.present?
      if user_is_logged_in?
        if @user.id == session[:id]
          reset_session
        end
      end
      @user.destroy
    end
      redirect_to action: "index", :notice => "User was successfully destroyed."
  end

    private
      def user_params
        params.require(:user).permit(:fname, :lname, :nickname, :email, :password, :password_confirmation)
      end
end
